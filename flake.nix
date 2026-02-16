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
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Rust
            cargo
            rustc
            rustfmt
            clippy

            # Tauri system deps
            pkg-config
            openssl
            glib
            gtk3
            libsoup_3
            webkitgtk_4_1
            librsvg
            gdk-pixbuf
            cairo
            pango
            atk

            # Tauri CLI
            cargo-tauri
          ];

          shellHook = ''
            echo "nerve dev shell — cargo tauri dev to run"
          '';
        };
      }
    );
}
