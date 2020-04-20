# Babylon Sphere
_A web-based tool for comping together several 360 photo / drawing layers and save / share that as a photosphere rendered in the browser with Bablyon.js._

Bablyon Sphere is a small nights and weekends project that resulted from some teaching I did at the Copenhagen Institute for Interaction Design in 2019. I introduced students to a simple workflow for using 360 photos and drawing on 360 grids and loading them on VR devices as photospheres so they could quickly mockup immersive experiences using tools they already know like pencil and paper or Photoshop and uses [LookSee VR](https://apps.apple.com/us/app/looksee-vr/id1093268628) as a viewer. It is targeted for very low fidelity prototypes and is largely an experiment in how far one can get with 360 photospheres for previsualizing an AR/VR application (and a chance for me to learn React and Babylon.js).

## Setting Up a Dev Environment
### Requirements 
- Git
- Yarn

### Steps
1. Clone the repo.
2. Run `yarn upgrade` to update local packages.
3. Run `yarn start` to run the application locally. 

## Mixing a 3D Bablyon Scene with React
Babylon Sphere uses React to drive the core logic and data-model for the application. It then uses a combination of 2D UI rendered with React and TSX; and Bablyon.js to render the 3D scene. React creates headless DOM elements like `ImageLayerSceneElement` to represent the data in the Bablyon scene. These headless elements are paired with 3D objects in the Babylon scene. The pair to `ImageLayerSceneElement` is `BablyonImageLayer` (TODO: Give these better names). A `Layer` may be represented in other ways as well, such as in the 2D UI stack with `ImagelayerInspector`.

## Finding Your Way Around
**`EditorController.ts`**: Editor Controller generally runs the show. It handles the Babylon tick and sets up the 3D scene. 

**`index.tsx`**: Defines the page at the top level. Instantiates the instance of Editor Controller.

**`Layer.ts`**: Defines the data-model for a photosphere layer. This is the most basic representation of a Layer.