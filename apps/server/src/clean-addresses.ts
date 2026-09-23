export interface CleanAddressPreset {
  id: string;
  label: string;
  value: string;
}

/**
 * Well-known Cloudflare clean IPs / domains that tend to work well as the
 * address shown in client configs. Users can pick several of these (or type
 * their own) per client; each generated config gets a random pick from the
 * selected set so clients don't all land on the same address.
 */
export const CLEAN_ADDRESS_PRESETS: CleanAddressPreset[] = [
  { id: "cf-104.16.0.0", label: "Cloudflare 104.16.0.0", value: "104.16.0.0" },
  { id: "cf-104.17.0.0", label: "Cloudflare 104.17.0.0", value: "104.17.0.0" },
  { id: "cf-104.18.0.0", label: "Cloudflare 104.18.0.0", value: "104.18.0.0" },
  { id: "cf-104.19.0.0", label: "Cloudflare 104.19.0.0", value: "104.19.0.0" },
  { id: "cf-104.20.0.0", label: "Cloudflare 104.20.0.0", value: "104.20.0.0" },
  { id: "cf-104.21.0.0", label: "Cloudflare 104.21.0.0", value: "104.21.0.0" },
  { id: "cf-104.24.0.0", label: "Cloudflare 104.24.0.0", value: "104.24.0.0" },
  { id: "cf-104.25.0.0", label: "Cloudflare 104.25.0.0", value: "104.25.0.0" },
  { id: "cf-172.64.0.0", label: "Cloudflare 172.64.0.0", value: "172.64.0.0" },
  { id: "cf-172.66.0.0", label: "Cloudflare 172.66.0.0", value: "172.66.0.0" },
  { id: "cf-172.67.0.0", label: "Cloudflare 172.67.0.0", value: "172.67.0.0" },
  { id: "cf-188.114.96.0", label: "Cloudflare 188.114.96.0", value: "188.114.96.0" },
  { id: "cf-188.114.97.0", label: "Cloudflare 188.114.97.0", value: "188.114.97.0" },
  { id: "cf-162.159.0.0", label: "Cloudflare 162.159.0.0", value: "162.159.0.0" },
  { id: "cf-chatgpt", label: "chatgpt.com", value: "chatgpt.com" },
  { id: "cf-openai", label: "openai.com", value: "openai.com" },
  { id: "cf-discord", label: "discord.com", value: "discord.com" },
  { id: "cf-shopify", label: "shopify.com", value: "shopify.com" },
  { id: "cf-zula", label: "zula.ir", value: "zula.ir" },
  { id: "cf-speed", label: "speed.cloudflare.com", value: "speed.cloudflare.com" },
];
