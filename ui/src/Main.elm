module Main exposing (main)

import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (id)


main : Html msg
main =
    div [ id "app" ]
        [ h1 [] [ text "Nerve" ]
        , div [] [ text "Hello from Elm" ]
        ]
