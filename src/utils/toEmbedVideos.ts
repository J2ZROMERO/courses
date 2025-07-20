/**
 * Convierte una URL de YouTube (cualquiera de sus formatos) a la URL embebible.
 *
 * Ejemplos de inputs:
 *  - https://youtu.be/dQw4w9WgXcQ
 *  - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *  - https://www.youtube.com/embed/dQw4w9WgXcQ
 *
 * Output:
 *  - https://www.youtube.com/embed/dQw4w9WgXcQ
 */
export function toYouTubeEmbed(url: string): string {
  try {
    const p = new URL(url);
    let id: string | null = null;

    if (p.hostname.includes("youtu.be")) {
      // https://youtu.be/ID
      id = p.pathname.slice(1);
    } else if (p.pathname.startsWith("/embed/")) {
      // ya es embed
      return url;
    } else {
      // busca en query param
      id = p.searchParams.get("v");
    }

    if (!id) return url;
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return url;
  }
}

/**
 * Convierte una URL de Vimeo a la URL embebible.
 *
 * Ejemplos:
 *  - https://vimeo.com/12345678
 *  - https://player.vimeo.com/video/12345678
 *
 * Output:
 *  - https://player.vimeo.com/video/12345678
 */
export function toVimeoEmbed(url: string): string {
  try {
    const p = new URL(url);
    // si ya es player.vimeo.com, devolvemos tal cual
    if (p.hostname.includes("player.vimeo.com")) {
      return url;
    }
    // extraemos el ID (último segmento)
    const parts = p.pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    if (!id) return url;
    return `https://player.vimeo.com/video/${id}`;
  } catch {
    return url;
  }
}

/**
 * Convierte una URL de Loom (share) a la URL embebible.
 *
 * Ejemplo:
 *  input:  "https://www.loom.com/share/ID?sid=..."
 *  output: "https://www.loom.com/embed/ID"
 */
export function toLoomEmbed(url: string): string {
  try {
    const p = new URL(url);
    const parts = p.pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    if (!id) return url;
    return `https://www.loom.com/embed/${id}`;
  } catch {
    return url;
  }
}

/**
 * Detecta la plataforma por hostname y devuelve la URL de embed adecuada.
 * Si no la reconoce, devuelve la URL original.
 */
export function toEmbedUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes("youtu.be") || hostname.includes("youtube.com")) {
      return toYouTubeEmbed(url);
    }
    if (hostname.includes("vimeo.com")) {
      return toVimeoEmbed(url);
    }
    if (hostname.includes("loom.com")) {
      return toLoomEmbed(url);
    }
    // añade más plataformas aquí si lo necesitas
    return url;
  } catch {
    return url;
  }
}
