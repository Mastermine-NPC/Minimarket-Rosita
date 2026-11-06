import { Providers } from "./providers";
import { AppRouter } from "./router";
import "@/styles/globals.css";
import "@/styles/modules.css";
import "@/styles/polish.css";
import "@/styles/rosita-editorial.css";
import "@/styles/product-glass.css";
import "@/styles/design-system.css";

export default function StoreEntry() { return <Providers><AppRouter /></Providers>; }
