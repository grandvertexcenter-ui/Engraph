import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
return {
id: "/",
name: "ENGRAPH — Engineering Network",
short_name: "ENGRAPH",
description:
"ENGRAPH is an engineering network for innovation, technology, and product development.",
start_url: "/",
scope: "/",
display: "standalone",
orientation: "portrait",
background_color: "#0B0F19",
theme_color: "#0B0F19",
icons: [
{
src: "/icons/icon-192.png",
sizes: "192x192",
type: "image/png",
purpose: "any",
},
{
src: "/icons/icon-512.png",
sizes: "512x512",
type: "image/png",
purpose: "any",
},
{
src: "/icons/icon.svg",
sizes: "any",
type: "image/svg+xml",
purpose: "any",
},
],
categories: ["education", "productivity", "technology"],
};
}
