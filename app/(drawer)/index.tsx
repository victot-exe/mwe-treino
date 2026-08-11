import { AppDispatch, RootState } from "@/src/store";
import { initializeDatabase } from "@/src/store/databaseSlice";
import { Link } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const initialized = useSelector(
    (state: RootState) => state.database.initialized
  );

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeDatabase());
    }
  }, [initialized, dispatch]);


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
