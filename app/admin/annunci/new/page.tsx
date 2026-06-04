import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createDraftListing } from "@/lib/listings/store";

export const metadata: Metadata = {
  title: "Nuovo annuncio",
  robots: { index: false, follow: false },
};

export default async function NewListingPage() {
  const draft = await createDraftListing();
  redirect(`/admin/annunci/${draft.id}`);
}
