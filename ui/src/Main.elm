module Main exposing (main)

import Browser
import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (id)
import Model exposing (Model, Msg(..), Page(..), initialModel)
import Ports
import Time
import Update


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = Update.update
        , view = view
        , subscriptions = subscriptions
        }


init : () -> ( Model, Cmd Msg )
init _ =
    ( initialModel, Cmd.none )


view : Model -> Html Msg
view _ =
    div [ id "app" ]
        [ h1 [] [ text "Nerve" ]
        , div [] [ text "Hello from Elm" ]
        ]


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Ports.receiveFromTauri ReceivedFromTauri
        , case model.page of
            MainPage ->
                Sub.batch
                    [ Time.every 5000 (\_ -> PollRooms)
                    , case model.selectedRoomId of
                        Just _ ->
                            Time.every 3000 (\_ -> PollMessages)

                        Nothing ->
                            Sub.none
                    ]

            LoginPage ->
                Sub.none
        ]
