import { useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { AmbientVideo } from "./ambient-video";
import { cinematicChapters } from "./cinematic-chapters";
export function CinematicChapter({ chapter, to, active = true }: {
  chapter: (typeof cinematicChapters)[number]; to: string; active?: boolean;
}) {
  const [selected, select] = useState(0);
  return <section id={chapter.id} className={`cinema-scene cinema-${chapter.tone}`} aria-labelledby={`${chapter.id}-title`} aria-hidden={!active || undefined} inert={!active || undefined}>
    <div className="cinema-scene-camera">
      {chapter.films.map((film, index) => <div key={film.file} className={"cinema-film-layer" + (index === selected ? " is-selected" : "")} aria-hidden={index !== selected || undefined}><AmbientVideo src={`/images/video/cinematic/${film.file}.mp4`} poster={`/images/video/cinematic/${film.file}.jpg`} label={film.name} enabled={active && index === selected} loop /></div>)}
    </div>
    <div className="cinema-scene-shade" />
    <div className="cinema-scene-content">
      <h2 id={`${chapter.id}-title`} className="cinema-kinetic-title" aria-label={chapter.title}>
        {chapter.title.split(" ").map((word, i) => <span className="cinema-word-mask" key={i} aria-hidden="true"><span className="cinema-word">{word}</span></span>)}
      </h2>
      <p>{chapter.description}</p>
      <Link to={to} className="cinema-explore">Explorar productos <ArrowUpRight aria-hidden="true" /></Link>
      {chapter.films.length > 1 && <div className="cinema-film-picker" role="group" aria-label={`Escena de ${chapter.id}`}>
        {chapter.films.map((item, index) => <button key={item.file} type="button" aria-pressed={selected === index} onClick={() => select(index)}>{item.name}</button>)}
      </div>}
    </div>
    <span className="cinema-scene-brand" aria-hidden="true">Rosita.</span>
  </section>;
}
