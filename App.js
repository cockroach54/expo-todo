import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  StatusBar,
  Dimensions,
  Platform,
  ScrollView,
  AsyncStorage
} from "react-native";
import Todo from "./Todo";
import { AppLoading } from "expo";
import uuidv1 from "uuid/v1";

const { height, width } = Dimensions.get("window");

export default class App extends Component {
  state = {
    newTodo: "",
    loadedTodos: false,
    todos: {}
  };
  componentDidMount = () => {
    this._loadTodos();
  };

  render() {
    const { newTodo, loadedTodos, todos } = this.state;
    if (!loadedTodos) {
      return <AppLoading />;
    }
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.title}>My Todos</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder={"New todo"}
            value={newTodo}
            onChangeText={this._cntrolNewTodo}
            placeholderTextColor={"#999"}
            returnKeyType={"done"}
            autoCorrect={false}
            onSubmitEditing={this._addTodo}
          />
          <ScrollView contentContainerStyle={styles.todos}>
            {/* <Todo text={"Go to school"} /> */}
            {Object.values(todos).reverse().map(todo => (
              <Todo
                {...todo}
                key={todo.id}
                deleteTodo={this._deleteTodo}
                uncompleteTodo={this._uncompleteTodo}
                completeTodo={this._completeTodo}
                updateTodo={this._updateTodo}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  _cntrolNewTodo = text => {
    this.setState({
      newTodo: text
    });
  };
  _loadTodos = async () => {
    try{
      const todos = await AsyncStorage.getItem("todos") || "{}";
      // console.log("[todos]:", todos);
      this.setState({
        loadedTodos: true,
        todos: JSON.parse(todos)
      });
    }
    catch(err){
      console.log('[Loading Error]:', err);
    }
  };
  _addTodo = () => {
    const { newTodo } = this.state;
    if (newTodo !== "") {
      this.setState(prevState => {
        const ID = uuidv1();
        const newTodoObject = {
          [ID]: {
            id: ID,
            isCompleted: false,
            text: newTodo,
            createdAt: Date.now()
          }
        };
        const newState = {
          ...prevState,
          newTodo: "",
          todos: {
            ...prevState.todos,
            ...newTodoObject
          }
        };
        this._saveTodos(newState.todos);
        return { ...newState };
      });
      // const todos = {
      //   3456789: {
      //     id: 3456789,
      //     text: "buy Something",
      //     isCompleted: false,
      //     date: 3456789012029
      //   },
      //   1234567: {
      //     id: 1234567,
      //     text: "make Something",
      //     isCompleted: false,
      //     date: 12345678998
      //   }
      // };
    }
  };
  _deleteTodo = id => {
    this.setState(prevState => {
      const todos = prevState.todos;
      delete todos[id];
      const newState = {
        ...prevState,
        ...todos
      };
      this._saveTodos(newState.todos);
      return { ...newState };
    });
  };
  _uncompleteTodo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        todos: {
          ...prevState.todos,
          [id]: {
            ...prevState.todos[id],
            isCompleted: false
          }
        }
      };
      this._saveTodos(newState.todos);
      return { ...newState };
    });
  };
  _completeTodo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        todos: {
          ...prevState.todos,
          [id]: {
            ...prevState.todos[id],
            isCompleted: true
          }
        }
      };
      this._saveTodos(newState.todos);
      return { ...newState };
    });
  };
  _updateTodo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        todos: {
          ...prevState.todos,
          [id]: {
            ...prevState.todos[id],
            text: text
          }
        }
      };
      this._saveTodos(newState.todos);
      return { ...newState };
    });
  };
  _saveTodos = newTodo => {
    // AsyncStorage는 스트링 형태로 저장. 오브젝트 저장은 에러남
    const saveTodos = AsyncStorage.setItem("todos", JSON.stringify(newTodo));
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e76cf0",
    alignItems: "center"
  },
  title: {
    color: "white",
    fontSize: 30,
    marginTop: 50,
    fontWeight: "100",
    marginBottom: 30
  },
  card: {
    backgroundColor: "white",
    flex: 1,
    width: width - 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    ...Platform.select({
      ios: {},
      android: {
        elevation: 3 // 안먹는듯
      }
    })
  },
  input: {
    padding: 20,
    borderBottomColor: "#bbb",
    borderBottomWidth: 1,
    fontSize: 25
  },
  todos: {
    alignItems: "center"
  }
});
