export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: number): string {
  const rounded = Math.round(price);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}\u00A0€`;
}

export function formatMileage(km: number): string {
  return new Intl.NumberFormat("it-IT").format(km) + " km";
}

export function getWhatsAppUrl(message: string): string {
  const phone = "393423834947";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
