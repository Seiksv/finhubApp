import React, { Component } from "react";
import { FlatList, StyleSheet } from "react-native";
import StockTicker from "./StockTicker";

class GridCurrencyTicker extends Component {
  render() {
    const data = [
      {
        symbol: "AAPL",
        data: {
          price: 130.48,
          change: 0.12,
          changePercent: 0.1,
        },
      },
    ];

    return (
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <StockTicker
            symbol={item.symbol}
            data={item.data}
            style={{ flex: 1 }}
          />
        )}
        keyExtractor={(item) => item.symbol}
        numColumns={1}
        style={styles.container}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
  },
});

export default GridCurrencyTicker;
