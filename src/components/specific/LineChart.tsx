import React from "react";
import { View, Dimensions, Text, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

class StocksLineChart extends React.Component {
  render() {
    console.log(this.props.data);
    const { data } = this.props;
    if (
      !data ||
      data.labels.length === 0 ||
      data.datasets[0].data.length === 0
    ) {
      return (
        <View>
          <Text>No hay datos disponibles</Text>
        </View>
      );
    }

    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={styles.title}>
          Only showing the current Stocks Selected.
        </Text>
        <Text style={styles.desciption}>
          (For more stocks, please tap on the Watchlist below)
        </Text>
        <LineChart
          data={data}
          width={Dimensions.get("window").width - 20}
          height={Dimensions.get("window").height / 1.8}
          verticalLabelRotation={30}
          withDots={true}
          withShadow={true}
          fromZero={true}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          segments={6}
          yLabelsOffset={4}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            flex: 1,
          }}
        />
        <View style={styles.infoCard}>
          <MaterialIcons name="error-outline" size={20} color="#878f98" />
          <Text style={styles.infoText}>
            May some stocks takes time to load, please wait.
          </Text>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  title: {
    fontFamily: "Roboto",
    fontSize: 26,
    fontWeight: "900",
    color: "#000",
    marginLeft: 8,
    letterSpacing: 0.15,
    alignSelf: "center",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  desciption: {
    fontFamily: "Roboto",
    fontSize: 16,
    fontWeight: "500",
    color: "#878f98",
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    marginVertical: 20,
  },
  infoText: {
    fontFamily: "Roboto",
    fontSize: 16,
    fontWeight: "500",
    color: "#878f98",
    marginLeft: 8,
  },
});
export default StocksLineChart;
