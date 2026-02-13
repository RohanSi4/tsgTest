"use client";

import { FormEvent, useEffect, useState } from "react";

type Order = {
  id: number;
  customer: string;
  item: string;
  qty: number;
  status: string;
  createdAt: string;
};

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (typeof data.error === "string") {
      return data.error;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState("");
  const [item, setItem] = useState("");
  const [qty, setQty] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  async function loadOrders() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        const message = await parseErrorMessage(response, "Failed to load orders");
        setError(message);
        return;
      }

      const data = (await response.json()) as Order[];
      setOrders(data);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer,
          item,
          qty: qty ? Number(qty) : undefined,
        }),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response, "Failed to add order");
        setError(message);
        return;
      }

      setCustomer("");
      setItem("");
      setQty("1");
      await loadOrders();
    } catch {
      setError("Failed to add order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page stack">
      <h1>Orders</h1>

      <section className="card stack">
        <h2>Add Order</h2>
        <form onSubmit={handleSubmit} className="order-form">
          <label>
            Customer
            <input value={customer} onChange={(event) => setCustomer(event.target.value)} />
          </label>
          <label>
            Item
            <input value={item} onChange={(event) => setItem(event.target.value)} />
          </label>
          <label>
            Qty
            <input
              type="number"
              min="1"
              step="1"
              value={qty}
              onChange={(event) => setQty(event.target.value)}
            />
          </label>
          <div>
            <button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Order"}
            </button>
          </div>
        </form>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Order Table</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>customer</th>
                <th>item</th>
                <th>qty</th>
                <th>status</th>
                <th>createdAt</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.item}</td>
                  <td>{order.qty}</td>
                  <td>{order.status}</td>
                  <td>{order.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
