import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/db";

interface OsmAddress {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  path?: string;
  neighbourhood?: string;
  suburb?: string;
  hamlet?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state_district?: string;
  state?: string;
  province?: string;
  region?: string;
}

interface OsmResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: OsmAddress;
}

function pickFirst(...values: Array<string | undefined>) {
  return values.find((value) => Boolean(value?.trim()))?.trim();
}

function buildAddressLabel(result: OsmResult) {
  const address = result.address;

  const streetName = pickFirst(
    address?.road,
    address?.pedestrian,
    address?.path,
    address?.neighbourhood,
    result.display_name.split(",")[0],
  );

  const houseNumber = address?.house_number?.trim();
  const street = [streetName, houseNumber].filter(Boolean).join(" ") || "Direccion";

  const city =
    pickFirst(
      address?.city,
      address?.town,
      address?.village,
      address?.municipality,
      address?.city_district,
      address?.suburb,
      address?.hamlet,
      address?.county,
    ) || "Ciudad";

  const province =
    pickFirst(
      address?.state,
      address?.province,
      address?.region,
      address?.state_district,
    ) || "Provincia";

  return {
    city,
    province,
    fullLabel: `${street}, ${city}, ${province}`,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const cityFilter = searchParams.get("city")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const agencyWhereClause = {
      role: "REALESTATE" as const,
      OR: [
        {
          realEstate: {
            agencyName: { contains: query, mode: "insensitive" as const },
          },
        },
      ],
      ...(cityFilter && {
        realEstate: {
          city: { contains: cityFilter, mode: "insensitive" as const },
        },
      }),
    };

    const [dbResults, osmResponse] = await Promise.all([
      prisma.allUsers.findMany({
        where: agencyWhereClause,
        include: { realEstate: true },
        take: 3,
      }),
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ar&addressdetails=1&limit=6`,
        { headers: { "User-Agent": "Urbik-App-v2" } },
      ),
    ]);

    const osmResults = (await osmResponse.json()) as OsmResult[];

    const suggestions = [
      ...dbResults.map((user) => ({
        type: "REALESTATE_USER",
        id: user.user_id,
        display_name: user.realEstate?.agencyName || user.email,
        city: user.realEstate?.city ?? null,
      })),
      ...osmResults.map((result) => ({
        type: "ADDRESS",
        id: result.place_id,
        display_name: result.display_name,
        lat: Number(result.lat),
        lon: Number(result.lon),
        ...buildAddressLabel(result),
      })),
    ];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
