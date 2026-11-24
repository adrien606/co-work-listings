# Architecture rules
- Store each listing's Matterport visit in `medias` with type `matterport`; this reuses existing access controls and ensures listing duplication copies visits without duplicating remote tours.
- Validate Matterport URLs through the shared visit helper before embedding, sharing or saving; only HTTPS links on my.matterport.com/show/ with a model identifier are allowed.