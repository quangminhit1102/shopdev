# Design Patterns In JS

Design patterns are reusable solutions to common programming problems. They provide templates for how to solve problems that can be used in many different situations. This guide covers the most commonly used design patterns organized by type, with JavaScript examples.

## Table of Contents

- [Creational Patterns](#creational-patterns)
- [Structural Patterns](#structural-patterns)
- [Behavioral Patterns](#behavioral-patterns)

## Creational Patterns

Creational patterns focus on object creation mechanisms, trying to create objects in a manner suitable to the situation.

### 1. Singleton

Ensures a class has only one instance and provides a global point of access to it.

**Use Cases:**

- Managing a shared resource (database connections, file systems)
- Coordinating application-wide state or configuration
- When exactly one object is needed (logging services, authentication)
- Centralized management of app settings or preferences

```javascript
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }

    this.data = [];
    Singleton.instance = this;
  }

  add(item) {
    this.data.push(item);
  }

  get() {
    return this.data;
  }
}

// Usage
const instance1 = new Singleton();
const instance2 = new Singleton();

instance1.add("item");
console.log(instance2.get()); // ['item']
console.log(instance1 === instance2); // true
```

### 2. Factory Method

Creates objects without specifying the exact class of object that will be created.

**Use Cases:**

- When a class cannot anticipate the type of objects it needs to create
- When you want to delegate responsibility to subclasses
- When you need to create different products based on runtime conditions
- When you want to decouple client code from concrete product classes

```javascript
class Vehicle {
  constructor(type) {
    this.type = type;
  }
}

class Car extends Vehicle {
  constructor() {
    super("car");
    this.wheels = 4;
  }

  drive() {
    return "Driving a car";
  }
}

class Motorcycle extends Vehicle {
  constructor() {
    super("motorcycle");
    this.wheels = 2;
  }

  drive() {
    return "Riding a motorcycle";
  }
}

class VehicleFactory {
  createVehicle(type) {
    switch (type) {
      case "car":
        return new Car();
      case "motorcycle":
        return new Motorcycle();
      default:
        throw new Error(`Vehicle type ${type} not supported.`);
    }
  }
}

// Usage
const factory = new VehicleFactory();
const car = factory.createVehicle("car");
const motorcycle = factory.createVehicle("motorcycle");

console.log(car.drive()); // 'Driving a car'
console.log(motorcycle.drive()); // 'Riding a motorcycle'
```

### 3. Builder

Separates the construction of a complex object from its representation.

**Use Cases:**

- When object construction involves multiple steps
- When you need different versions of an object (different configurations)
- When you want to encapsulate complex creation logic
- When you need to construct objects with many optional parameters

```javascript
class Burger {
  constructor(builder) {
    this.size = builder.size;
    this.cheese = builder.cheese || false;
    this.pepperoni = builder.pepperoni || false;
    this.lettuce = builder.lettuce || false;
    this.tomato = builder.tomato || false;
  }
}

class BurgerBuilder {
  constructor(size) {
    this.size = size;
  }

  addCheese() {
    this.cheese = true;
    return this;
  }

  addPepperoni() {
    this.pepperoni = true;
    return this;
  }

  addLettuce() {
    this.lettuce = true;
    return this;
  }

  addTomato() {
    this.tomato = true;
    return this;
  }

  build() {
    return new Burger(this);
  }
}

// Usage
const burger = new BurgerBuilder(4)
  .addCheese()
  .addPepperoni()
  .addLettuce()
  .build();

console.log(burger);
```

### 4. Prototype

Creates new objects by cloning an existing object.

**Use Cases:**

- When object creation is expensive (database operations, API calls)
- When you need to create objects similar to existing ones
- When you want to avoid subclassing
- When your application needs to create objects dynamically

```javascript
const carPrototype = {
  init(model, color) {
    this.model = model;
    this.color = color;
    return this;
  },

  getInfo() {
    return `A ${this.color} ${this.model}`;
  },
};

function createCar(model, color) {
  return Object.create(carPrototype).init(model, color);
}

// Usage
const car1 = createCar("Tesla", "black");
const car2 = createCar("Ford", "blue");

console.log(car1.getInfo()); // 'A black Tesla'
console.log(car2.getInfo()); // 'A blue Ford'
```

## Structural Patterns

Structural patterns are concerned with how classes and objects are composed to form larger structures.

### 1. Adapter

Allows classes with incompatible interfaces to work together.

**Use Cases:**

- When you need to use an existing class with an incompatible interface
- When you want to reuse existing code that doesn't match your interface requirements
- When integrating with third-party libraries or APIs
- When refactoring code to maintain backward compatibility

```javascript
// Old interface
class OldCalculator {
  calculate(operation, a, b) {
    switch (operation) {
      case "add":
        return a + b;
      case "sub":
        return a - b;
      default:
        return NaN;
    }
  }
}

// New interface
class NewCalculator {
  add(a, b) {
    return a + b;
  }

  sub(a, b) {
    return a - b;
  }
}

// Adapter
class CalculatorAdapter {
  constructor() {
    this.calculator = new NewCalculator();
  }

  calculate(operation, a, b) {
    switch (operation) {
      case "add":
        return this.calculator.add(a, b);
      case "sub":
        return this.calculator.sub(a, b);
      default:
        return NaN;
    }
  }
}

// Usage
const oldCalc = new OldCalculator();
console.log(oldCalc.calculate("add", 10, 5)); // 15

const newCalc = new NewCalculator();
console.log(newCalc.add(10, 5)); // 15

const adapter = new CalculatorAdapter();
console.log(adapter.calculate("add", 10, 5)); // 15
```

### 2. Decorator

Adds new functionality to an object dynamically.

**Use Cases:**

- When you need to add responsibilities to objects dynamically
- When inheritance is not feasible (too many subclasses would be required)
- When you want to modify object functionality without changing its interface
- When you need to stack multiple behaviors on top of each other

```javascript
class Coffee {
  getCost() {
    return 5;
  }

  getDescription() {
    return "Regular coffee";
  }
}

// Decorator
function withMilk(coffee) {
  const cost = coffee.getCost();
  const description = coffee.getDescription();

  coffee.getCost = () => cost + 1;
  coffee.getDescription = () => `${description} with milk`;

  return coffee;
}

// Decorator
function withSugar(coffee) {
  const cost = coffee.getCost();
  const description = coffee.getDescription();

  coffee.getCost = () => cost + 0.5;
  coffee.getDescription = () => `${description} with sugar`;

  return coffee;
}

// Usage
let coffee = new Coffee();
coffee = withMilk(coffee);
coffee = withSugar(coffee);

console.log(coffee.getCost()); // 6.5
console.log(coffee.getDescription()); // 'Regular coffee with milk with sugar'
```

### 3. Facade

Provides a simplified interface to a complex subsystem.

**Use Cases:**

- When you need to provide a simple interface to a complex system
- When there are many dependencies between clients and implementation classes
- When you want to layer your subsystems
- When you need to shield clients from subsystem components

```javascript
class CPU {
  freeze() {
    console.log("CPU frozen");
  }
  jump(position) {
    console.log(`Jump to ${position}`);
  }
  execute() {
    console.log("CPU executing commands");
  }
}

class Memory {
  load(position, data) {
    console.log(`Loading ${data} to position ${position}`);
  }
}

class HardDrive {
  read(sector, size) {
    console.log(`Reading ${size} bytes from sector ${sector}`);
    return "data";
  }
}

// Facade
class ComputerFacade {
  constructor() {
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hardDrive = new HardDrive();
  }

  start() {
    this.cpu.freeze();
    this.memory.load(0, this.hardDrive.read(0, 1024));
    this.cpu.jump(0);
    this.cpu.execute();
  }
}

// Usage
const computer = new ComputerFacade();
computer.start();
```

### 4. Proxy

Provides a surrogate or placeholder for another object to control access to it.

**Use Cases:**

- When you need lazy initialization (virtual proxy)
- Access control to the original object (protection proxy)
- When you need to add logging, caching, or validation before accessing the real object
- Remote resource access or communication (remote proxy)

```javascript
class RealImage {
  constructor(filename) {
    this.filename = filename;
    this.loadFromDisk();
  }

  loadFromDisk() {
    console.log(`Loading ${this.filename} from disk`);
  }

  display() {
    console.log(`Displaying ${this.filename}`);
  }
}

class ProxyImage {
  constructor(filename) {
    this.filename = filename;
    this.realImage = null;
  }

  display() {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}

// Usage
const image = new ProxyImage("photo.jpg");
// Image is not loaded until display() is called
console.log("Image created");
image.display(); // Loading occurs at this point
image.display(); // No loading needed
```

## Behavioral Patterns

Behavioral patterns are concerned with algorithms and the assignment of responsibilities between objects.

### 1. Observer

Defines a one-to-many dependency so that when one object changes state, all its dependents are notified.

**Use Cases:**

- When changes to one object require changing others
- Event handling systems
- Implementing distributed event handling systems
- When you need to notify multiple objects about changes without coupling them

```javascript
class Subject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify(data) {
    this.observers.forEach((observer) => observer.update(data));
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }

  update(data) {
    console.log(`${this.name} received: ${data}`);
  }
}

// Usage
const subject = new Subject();
const observer1 = new Observer("Observer 1");
const observer2 = new Observer("Observer 2");

subject.subscribe(observer1);
subject.subscribe(observer2);

subject.notify("Hello observers!");
// Observer 1 received: Hello observers!
// Observer 2 received: Hello observers!

subject.unsubscribe(observer1);
subject.notify("Hello again!");
// Observer 2 received: Hello again!
```

### 2. Strategy

Defines a family of algorithms, encapsulates each one, and makes them interchangeable.

**Use Cases:**

- When you need different variants of an algorithm
- When you need to switch between different behaviors at runtime
- When an object needs to support different behaviors that can be switched
- To isolate the algorithm logic from the client that uses it

```javascript
class PaymentStrategy {
  pay(amount) {}
}

class CreditCardStrategy extends PaymentStrategy {
  constructor(cardNumber, cvv, expiryDate) {
    super();
    this.cardNumber = cardNumber;
    this.cvv = cvv;
    this.expiryDate = expiryDate;
  }

  pay(amount) {
    console.log(`Paid ${amount} using credit card`);
  }
}

class PayPalStrategy extends PaymentStrategy {
  constructor(email) {
    super();
    this.email = email;
  }

  pay(amount) {
    console.log(`Paid ${amount} using PayPal`);
  }
}

class ShoppingCart {
  constructor() {
    this.items = [];
    this.paymentStrategy = null;
  }

  addItem(item) {
    this.items.push(item);
  }

  setPaymentStrategy(paymentStrategy) {
    this.paymentStrategy = paymentStrategy;
  }

  checkout() {
    const amount = this.items.reduce((total, item) => total + item.price, 0);
    this.paymentStrategy.pay(amount);
  }
}

// Usage
const cart = new ShoppingCart();
cart.addItem({ name: "Item 1", price: 100 });
cart.addItem({ name: "Item 2", price: 50 });

// Pay with credit card
cart.setPaymentStrategy(new CreditCardStrategy("1234-5678", "123", "12/2025"));
cart.checkout(); // 'Paid 150 using credit card'

// Pay with PayPal
cart.setPaymentStrategy(new PayPalStrategy("example@email.com"));
cart.checkout(); // 'Paid 150 using PayPal'
```

### 3. Command

Encapsulates a request as an object, thereby letting you parameterize clients with different requests.

**Use Cases:**

- When you need to parameterize objects with operations
- When you need to queue, specify, or execute requests at different times
- For implementing undo/redo functionality
- For implementing logging and transaction systems

```javascript
class Light {
  turnOn() {
    console.log("Light is on");
  }

  turnOff() {
    console.log("Light is off");
  }
}

class LightOnCommand {
  constructor(light) {
    this.light = light;
  }

  execute() {
    this.light.turnOn();
  }
}

class LightOffCommand {
  constructor(light) {
    this.light = light;
  }

  execute() {
    this.light.turnOff();
  }
}

class RemoteControl {
  constructor() {
    this.command = null;
  }

  setCommand(command) {
    this.command = command;
  }

  pressButton() {
    this.command.execute();
  }
}

// Usage
const light = new Light();
const lightOn = new LightOnCommand(light);
const lightOff = new LightOffCommand(light);
const remote = new RemoteControl();

remote.setCommand(lightOn);
remote.pressButton(); // 'Light is on'

remote.setCommand(lightOff);
remote.pressButton(); // 'Light is off'
```

### 4. Iterator

Provides a way to access elements of an aggregate object sequentially without exposing its underlying representation.

**Use Cases:**

- When you need to traverse a collection without exposing its structure
- When you want to provide a standard way to iterate over different collections
- When you need multiple traversal algorithms for the same collection
- When you want to decouple algorithms from the collections they operate on

```javascript
class Iterator {
  constructor(collection) {
    this.collection = collection;
    this.index = 0;
  }

  hasNext() {
    return this.index < this.collection.length;
  }

  next() {
    return this.hasNext() ? this.collection[this.index++] : null;
  }
}

class Collection {
  constructor() {
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
  }

  getIterator() {
    return new Iterator(this.items);
  }
}

// Usage
const collection = new Collection();
collection.addItem("Item 1");
collection.addItem("Item 2");
collection.addItem("Item 3");

const iterator = collection.getIterator();
while (iterator.hasNext()) {
  console.log(iterator.next());
}
```

### 5. State

Allows an object to alter its behavior when its internal state changes.

**Use Cases:**

- When an object's behavior depends on its state
- When you need to avoid large conditional statements for managing state
- When you need to handle state transitions in a clean, organized way
- For implementing state machines

```javascript
class State {
  constructor(player) {
    this.player = player;
  }

  pressPlay() {}
}

class ReadyState extends State {
  constructor(player) {
    super(player);
  }

  pressPlay() {
    this.player.setState(new PlayingState(this.player));
    console.log("Now playing...");
  }
}

class PlayingState extends State {
  constructor(player) {
    super(player);
  }

  pressPlay() {
    this.player.setState(new PausedState(this.player));
    console.log("Paused");
  }
}

class PausedState extends State {
  constructor(player) {
    super(player);
  }

  pressPlay() {
    this.player.setState(new PlayingState(this.player));
    console.log("Resuming playback...");
  }
}

class AudioPlayer {
  constructor() {
    this.state = new ReadyState(this);
  }

  setState(state) {
    this.state = state;
  }

  pressPlay() {
    this.state.pressPlay();
  }
}

// Usage
const player = new AudioPlayer();
player.pressPlay(); // 'Now playing...'
player.pressPlay(); // 'Paused'
player.pressPlay(); // 'Resuming playback...'
```
