/**
 * Lazily inject the Razorpay Checkout script, once. Resolves to window.Razorpay.
 * Used by Checkout to open the hosted checkout when the backend returns a
 * razorpay_order_id (i.e. Razorpay keys are configured).
 */
let loaderPromise = null;

export function loadRazorpay() {
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => {
      loaderPromise = null;
      reject(new Error("Could not load the payment gateway. Check your connection."));
    };
    document.body.appendChild(script);
  });
  return loaderPromise;
}
