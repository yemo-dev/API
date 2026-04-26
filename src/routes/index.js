import { statsRoute, statsHandler } from './stats/index.js'
import { keyStatusRoute, keyStatusHandler } from './auth/index.js'
import * as Anime from './anime/index.js'

export const setupRoutes = (app) => {
    app.openapi(statsRoute, statsHandler)
    app.openapi(keyStatusRoute, keyStatusHandler)
    
    app.openapi(Anime.animeHomeRoute, Anime.animeHomeHandler)
    app.openapi(Anime.animeSliderRoute, Anime.animeSliderHandler)
    app.openapi(Anime.animeSearchRoute, Anime.animeSearchHandler)
    app.openapi(Anime.animeDetailRoute, Anime.animeDetailHandler)
    app.openapi(Anime.animeEpisodeRoute, Anime.animeEpisodeHandler)
    app.openapi(Anime.animeTerbaruRoute, Anime.animeTerbaruHandler)
    app.openapi(Anime.animePopulerRoute, Anime.animePopulerHandler)
    app.openapi(Anime.animeOngoingRoute, Anime.animeOngoingHandler)
    app.openapi(Anime.animeCompletedRoute, Anime.animeCompletedHandler)
    app.openapi(Anime.animeMovieRoute, Anime.animeMovieHandler)
    app.openapi(Anime.animeGenresRoute, Anime.animeGenresHandler)
    app.openapi(Anime.animeGenreRoute, Anime.animeGenreHandler)
}
