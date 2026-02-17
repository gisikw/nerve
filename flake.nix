{
  description = "Nerve — Matrix client for Exocortex";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        isLinux = pkgs.stdenv.isLinux;
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Rust
            cargo
            rustc
            rustfmt
            clippy

            # Tauri CLI
            cargo-tauri
            pkg-config
            openssl
            sqlite

            # Frontend (Elm + Vite)
            nodejs
            elmPackages.elm
          ] ++ pkgs.lib.optionals isLinux [
            # Linux: GTK/WebKitGTK (macOS uses system WebKit)
            glib
            gtk3
            libsoup_3
            webkitgtk_4_1
            librsvg
            gdk-pixbuf
            cairo
            pango
            atk
          ];

          shellHook = ''
            echo "nerve dev shell — cargo tauri dev to run"
          '';
        };
      }
    );
}
