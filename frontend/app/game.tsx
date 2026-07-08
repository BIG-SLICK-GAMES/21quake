import { Redirect } from "expo-router";
import { QUAKERoutes } from "../src/navigation/routes";

export default function GameScreen() {
  return <Redirect href={QUAKERoutes.lobby} />;
}
