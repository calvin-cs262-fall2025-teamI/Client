import { router } from "expo-router";
import { View } from "react-native";
import { Appbar, Button } from "react-native-paper";

export default function SchedulePage(){
    return(
         <View>
          <Appbar.Header style={{ backgroundColor: "#388E3C" }}>
                <Appbar.Content title="Schedule" titleStyle={{ color: "#fff", fontWeight: "700" }} />
              
              </Appbar.Header>
              

               <Button
                          mode="contained"
                            style={{ margin: 20, borderRadius: 10, paddingVertical: 4 }}
                          labelStyle={{ fontSize: 16, fontWeight: "600" }}
                          onPress={() => router.push("/screens/admin/(tabs)/schedule/create_schedule")}
                          buttonColor="#388E3C"
                        >
                          Create New Schedule
                        </Button>

              
        </View>
    )
}