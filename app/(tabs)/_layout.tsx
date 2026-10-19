import Ionicons from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";
import { useColores } from "../../src/tema";

export default function TabsLayout() {
  const c = useColores();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.primario,
        tabBarInactiveTintColor: c.textoSuave,
        tabBarStyle: { backgroundColor: c.tarjeta, borderTopColor: c.borde },
        headerStyle: { backgroundColor: c.primario },
        headerTintColor: "#fff",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ParanaGo",
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="lineas"
        options={{
          title: "Líneas",
          tabBarIcon: ({ color, size }) => <Ionicons name="bus" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="paradas"
        options={{
          title: "Paradas",
          tabBarIcon: ({ color, size }) => <Ionicons name="location" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="avisos"
        options={{
          title: "Avisos",
          tabBarIcon: ({ color, size }) => <Ionicons name="warning" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="yo"
        options={{
          title: "Yo",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
