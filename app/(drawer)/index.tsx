import { initDatabase } from "@/src/database/database";
import { Link } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  
  useEffect(()=>{
    initDatabase()
      .then(()=>console.log("Database initialized"))
      .catch((err)=>console.log("Database initialization failed:", err));
  }, []);
  
  return (
    <View>
      <Text>🏋️ Fit Daily</Text>
      <Link href="/treino" asChild>
        <TouchableOpacity>
          <Text>Ver Meus Treinos</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
