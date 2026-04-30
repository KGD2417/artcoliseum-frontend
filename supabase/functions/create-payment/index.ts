import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Razorpay credentials from secrets
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpaySecret = Deno.env.get("RAZORPAY_SECRET");

    if (!razorpayKeyId || !razorpaySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order from database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.status === "paid") {
      return new Response(JSON.stringify({ error: "Order already paid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Razorpay order
    const razorpayAmount = Math.round(order.total * 100); // Convert to paise

    const razorpayOrder = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${razorpayKeyId}:${razorpaySecret}`)}`,
      },
      body: JSON.stringify({
        amount: razorpayAmount,
        currency: order.currency || "INR",
        receipt: order_id.slice(0, 40),
        notes: {
          order_id: order_id,
          email: order.email,
        },
      }),
    });

    const razorpayData = await razorpayOrder.json();

    if (!razorpayOrder.ok) {
      console.error("Razorpay error:", razorpayData);
      return new Response(
        JSON.stringify({ error: "Failed to create Razorpay order" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update order with Razorpay order ID
    await supabase
      .from("orders")
      .update({
        payment_id: razorpayData.id,
        payment_meta: { razorpay_order_id: razorpayData.id },
      })
      .eq("id", order_id);

    return new Response(
      JSON.stringify({
        razorpay_order_id: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        key_id: razorpayKeyId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
