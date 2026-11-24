import { describe, expect, it } from "vitest";
import { buildListingShareUrl, getMatterportUrl, matterportUrlSchema } from "./matterport";

const sharedTour = "https://my.matterport.com/show/?play=1&views=0&m=n5g25nc25nf9bwh33db4m6htc&ss=129&sr=-3.06,-1.08";

describe("Matterport visits", () => {
  it("allows the same complete visit on the 40m2 and 48m2 listings", () => {
    const listings = ["40m2 d'atelier", "48m2 d'atelier"].map((titre) => ({
      titre, medias: [{ type: "matterport", url: sharedTour }],
    }));
    expect(listings.map((listing) => getMatterportUrl(listing.medias))).toEqual([sharedTour, sharedTour]);
  });
  it("includes the full visit with its starting position in the sharing email", () => {
    const url = buildListingShareUrl("40m2 d'atelier", "https://co-work-listings.lovable.app/annonce/208b5fc7-0f98-4dda-b06e-ae333f801f36", sharedTour);
    const body = new URL(url).searchParams.get("body");
    expect(body).toContain(sharedTour);
    expect(body).toContain("https://co-work-listings.lovable.app/annonce/208b5fc7-0f98-4dda-b06e-ae333f801f36");
  });
  it("supports clearing a visit without exporting an invalid link", () => {
    expect(matterportUrlSchema.parse("")).toBe("");
    expect(getMatterportUrl([{ type: "matterport", url: "" }])).toBeNull();
  });
  it("rejects unsafe and non-Matterport URLs", () => {
    for (const url of ["javascript:alert(1)", "https://my.matterport.com.evil.test/show/?m=test", "http://my.matterport.com/show/?m=test", "https://my.matterport.com/show/"]) {
      expect(matterportUrlSchema.safeParse(url).success).toBe(false);
    }
  });
});