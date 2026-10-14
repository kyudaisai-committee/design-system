import AsyncStorage from "@react-native-async-storage/async-storage";

import { view } from "./storybook.requires";

const StorybookUI = view.getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});
registerRootComponent(StorybookUI);
export default StorybookUI;
import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
