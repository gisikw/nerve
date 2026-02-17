module Main exposing (main)

import Browser
import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (id)
import Model exposing (Model, Msg(..), Page(..), initialModel)
import Ports


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


init : () -> ( Model, Cmd Msg )
init _ =
    ( initialModel, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update _ model =
    ( model, Cmd.none )


view : Model -> Html Msg
view _ =
    div [ id "app" ]
        [ h1 [] [ text "Nerve" ]
        , div [] [ text "Hello from Elm" ]
        ]


subscriptions : Model -> Sub Msg
subscriptions _ =
    Ports.receiveFromTauri ReceivedFromTauri
