import { NextResponse } from "next/server";
import { appendOrder, nextOrderId, readOrders } from "@/lib/ordersCsv";

export const runtime = "nodejs";

export async function GET() {
  try {
    const orders = await readOrders();
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Failed to read orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }

  const { customer, item, qty } = payload as Record<string, unknown>;
  const normalizedCustomer = typeof customer === "string" ? customer.trim() : "";
  const normalizedItem = typeof item === "string" ? item.trim() : "";

  if (!normalizedCustomer) {
    return NextResponse.json({ error: "customer is required" }, { status: 400 });
  }

  if (!normalizedItem) {
    return NextResponse.json({ error: "item is required" }, { status: 400 });
  }

  let normalizedQty = 1;
  if (qty !== undefined && qty !== null && qty !== "") {
    const parsedQty = Number(qty);
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      return NextResponse.json({ error: "qty must be a positive integer" }, { status: 400 });
    }
    normalizedQty = parsedQty;
  }

  try {
    const orders = await readOrders();
    const createdOrder = {
      id: nextOrderId(orders),
      customer: normalizedCustomer,
      item: normalizedItem,
      qty: normalizedQty,
      status: "processing",
      createdAt: new Date().toISOString(),
    };

    await appendOrder(createdOrder);
    return NextResponse.json(createdOrder, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
