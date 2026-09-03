import { View, Text, StyleSheet, Button } from "react-native";


export default function AboutScreen({ navigation, route }) {


  const { name } = route.params;


  return (
    <View style={styles.container}>


      <Text style={styles.text}>
        About {name}
      </Text>


      <Button
        title="Go Back"
        onPress={() => navigation.goBack()}
      />


    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },


  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
