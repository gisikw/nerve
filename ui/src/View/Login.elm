module View.Login exposing (view)

import Html exposing (Html, button, div, form, h1, input, label, p, text)
import Html.Attributes exposing (class, disabled, for, id, name, placeholder, required, type_, value)
import Html.Events exposing (onInput, onSubmit)
import Model exposing (Model, Msg(..))


view : Model -> Html Msg
view model =
    div [ id "login-view", class "view" ]
        [ form [ id "login-form", onSubmit SubmitLogin ]
            [ h1 [] [ text "Nerve" ]
            , label [ for "homeserver" ] [ text "Homeserver" ]
            , input
                [ type_ "text"
                , id "homeserver"
                , name "homeserver"
                , placeholder "matrix.example.org"
                , required True
                , value model.loginForm.homeserver
                , onInput SetHomeserver
                , disabled model.loginLoading
                ]
                []
            , label [ for "username" ] [ text "Username" ]
            , input
                [ type_ "text"
                , id "username"
                , name "username"
                , placeholder "alice"
                , required True
                , value model.loginForm.username
                , onInput SetUsername
                , disabled model.loginLoading
                ]
                []
            , label [ for "password" ] [ text "Password" ]
            , input
                [ type_ "password"
                , id "password"
                , name "password"
                , required True
                , value model.loginForm.password
                , onInput SetPassword
                , disabled model.loginLoading
                ]
                []
            , button
                [ type_ "submit"
                , disabled model.loginLoading
                ]
                [ text
                    (if model.loginLoading then
                        "Connecting..."

                     else
                        "Log in"
                    )
                ]
            , case model.loginError of
                Just err ->
                    p [ id "login-error", class "error" ] [ text err ]

                Nothing ->
                    text ""
            , if model.loginLoading then
                p [ id "login-status", class "status" ] [ text "Connecting..." ]

              else
                text ""
            ]
        ]
