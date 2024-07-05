import React, { Component } from "react";
{
  /* Contenido del modal */
}
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventEmitter } from "eventemitter3";
import { Card, Button, IconButton, FAB } from "react-native-paper";

export const globalEventEmitter = new EventEmitter();

class StockSelect extends Component {
  state = {
    selectedStocks: [], // Cambiado a un arreglo para almacenar múltiples selecciones
    priceAlerts: [], // Arreglo para almacenar múltiples alertas de precio
    isModalVisible: false,
    selectedStock: "AAPL", // Valor predeterminado para el picker
    priceAlert: "", // Valor predeterminado para el input de alerta de precio
  };

  componentDidMount() {
    this.loadSelectedStock();
  }

  saveSelectedStock = async (selectedStock: String, priceAlert: String) => {
    const { selectedStocks, priceAlerts } = this.state;
    const newSelectedStocks = [...selectedStocks, selectedStock]; // Agrega la nueva selección al arreglo existente
    const newPriceAlerts = [...priceAlerts, priceAlert]; // Agrega la nueva alerta al arreglo existente

    try {
      // Guarda los arreglos actualizados en AsyncStorage
      await AsyncStorage.setItem(
        "selectedStocks",
        JSON.stringify(newSelectedStocks)
      );
      await AsyncStorage.setItem("priceAlerts", JSON.stringify(newPriceAlerts));
      // Actualiza el estado con los nuevos arreglos
      this.setState({
        selectedStocks: newSelectedStocks,
        priceAlerts: newPriceAlerts,
      });

      globalEventEmitter.emit("stockUpdated");
    } catch (error) {
      console.log(error);
    }
  };

  loadSelectedStock = async () => {
    try {
      const selectedStocks = await AsyncStorage.getItem("selectedStocks");
      const priceAlerts = await AsyncStorage.getItem("priceAlerts");
      if (selectedStocks !== null && priceAlerts !== null) {
        // Actualiza el estado con los arreglos cargados
        this.setState({
          selectedStocks: JSON.parse(selectedStocks),
          priceAlerts: JSON.parse(priceAlerts),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  deleteSelectedItem = async (index: number) => {
    let { selectedStocks, priceAlerts } = this.state;
    // Elimina el ítem en el índice proporcionado de ambos arreglos
    selectedStocks.splice(index, 1);
    priceAlerts.splice(index, 1);

    try {
      // Guarda los arreglos actualizados en AsyncStorage
      await AsyncStorage.setItem(
        "selectedStocks",
        JSON.stringify(selectedStocks)
      );
      await AsyncStorage.setItem("priceAlerts", JSON.stringify(priceAlerts));
      // Actualiza el estado con los arreglos actualizados
      this.setState({ selectedStocks, priceAlerts });
      globalEventEmitter.emit("stockUpdated");
    } catch (error) {
      console.log(error);
    }
  };

  renderStockList = () => {
    const { selectedStocks, priceAlerts } = this.state;
    return (
      <FlatList
        data={selectedStocks}
        keyExtractor={(item, index) => index.toString()}
        style={{ flex: 1 }}
        renderItem={({ item, index }) => (
          <View style={styles.listItem}>
            <Text>Stock: {item}</Text>
            <Text>Alerta de precio: {priceAlerts[index]}</Text>
            <Button
              title="Eliminar"
              onPress={() => this.deleteSelectedItem(index)} // Llama a deleteSelectedItem con el índice del ítem
            />
          </View>
        )}
      />
    );
  };

  renderStockList = () => {
    // Asumiendo que selectedStocks es un array de objetos stock
    const { selectedStocks, priceAlerts } = this.state;

    return (
      <FlatList
        data={selectedStocks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Card
            key={index}
            style={{
              marginHorizontal: 20,
              marginVertical: 10,
              width: Dimensions.get("window").width - 30,
              flex: 1,
            }}
          >
            <Card.Title
              title={"STOCK SELECTED"}
              titleStyle={{ fontWeight: "bold", fontSize: 12 }} // Agrega más peso al título
            />

            <Card.Content>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "900",
                }}
              >
                {"$" + priceAlerts[index]}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "300",
                  lineHeight: 24,
                }}
              >
                {item}
              </Text>
            </Card.Content>
            <Card.Actions>
              <IconButton
                icon="trash-can-outline"
                color="red"
                size={20}
                onPress={() => this.deleteSelectedItem(index)}
              />
            </Card.Actions>
          </Card>
        )}
      />
    );
  };

  setModalVisible = (visible: Boolean) => {
    this.setState({ isModalVisible: visible });
  };

  render() {
    return (
      <View style={styles.container}>
        {this.renderStockList()}

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.isModalVisible}
          onRequestClose={() => {
            this.setModalVisible(!this.state.isModalVisible);
          }}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => this.setModalVisible(false)} // Cierra el modal al tocar fuera del formulario
          >
            <View
              style={styles.modalView}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.title}>Add a stock alert</Text>
              <Text>
                Select a stock and set an alert price to receive notifications{" "}
              </Text>

              <View style={styles.textSpacer} />

              <Text> Select the stock to watch </Text>
              <Picker
                selectedValue={this.state.selectedStock}
                style={styles.picker}
                onValueChange={(itemValue, itemIndex) => {
                  this.setState({ selectedStock: itemValue });
                }}
              >
                <Picker.Item label="Apple" value="AAPL" />
                <Picker.Item label="Amazon" value="AMZN" />
                <Picker.Item label="BTC - USDT" value="BINANCE:BTCUSDT" />
                <Picker.Item label="ETH - USDT" value="BINANCE:ETHUSDT" />
                <Picker.Item label="DOGE - USDT" value="BINANCE:DOGEUSDT" />
                <Picker.Item label="GBP - USDT" value="BINANCE:GBPUSDT" />
                <Picker.Item label="SOL - USDT" value="BINANCE:SOLUSDT" />
              </Picker>
              <Text> Set max price to launch the alert </Text>
              <TextInput
                style={styles.input}
                onChangeText={(text) => this.setState({ priceAlert: text })}
                value={this.state.priceAlert}
                placeholder="Example 50"
                keyboardType="numeric"
              />
              <View style={styles.buttonContainer}>
                <Button
                  onPress={() => this.setModalVisible(false)}
                  mode="contained"
                  buttonColor="#fff"
                  labelStyle={{ color: "#B00020", fontSize: 18 }}
                  style={{
                    marginTop: 10,
                    flex: 1,
                    borderWidth: 2, // Grosor del borde
                    borderColor: "#B00020", // Color del borde
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onPress={() => {
                    if (
                      this.state.priceAlert === "" ||
                      Number(this.state.priceAlert) <= 0 ||
                      isNaN(Number(this.state.priceAlert))
                    ) {
                      alert("Please enter a valid price");
                      return;
                    }
                    this.setModalVisible(!this.state.isModalVisible);
                    this.saveSelectedStock(
                      this.state.selectedStock,
                      this.state.priceAlert
                    );
                  }}
                  mode="contained"
                  buttonColor="#ff7300"
                  labelStyle={{ color: "#fff", fontSize: 18 }}
                  style={{ marginTop: 10, flex: 1, marginStart: 10 }}
                >
                  Save
                </Button>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        <FAB
          style={styles.fab}
          icon="plus"
          color="#fff"
          onPress={() => this.setModalVisible(true)}
          theme={{ colors: { accent: "#fff", backgroundColor: "#fff" } }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listItem: {
    flex: 1,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  picker: {
    height: 40,
    width: 250,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
  },
  input: {
    width: 250,
    backgroundColor: "#f0f0f0",
    marginBottom: 20,
    borderRadius: 4,
    paddingHorizontal: 10,
    height: 50,
  },
  buttonSpacer: {
    width: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 40,
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 10,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
  },
  textSpacer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#ff7300",
  },
});

export default StockSelect;
