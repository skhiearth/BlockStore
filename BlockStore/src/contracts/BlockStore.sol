// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

contract BlockStore {

    string name;

    constructor() public {
        name = "BlockStore";
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function setName(string calldata newName) external {
        name = newName;
    }
    
     // Track total number of products, orders and sellers
    uint public productCount = 0;
    uint public orderCount = 0;
    uint public sellerCount = 0;
    uint public buyerCount = 0;
    
    // Mappings to keep track of structs
    mapping(address => Seller) public Sellers;
    mapping(address => Buyer) public Buyers;
    mapping(uint => Product) public Products;
    
    // List of all product
    Product[] public ProductList;
    
    // Get orders for a user
    mapping(address => Order[]) public UserOrders;
    mapping(address => PlacedOrders[]) public SellerOrders;
    
    
    // Seller
    struct Seller {
        string name;
        address publicAddress;
        bool created;
    }
    
    // Buyer
    struct Buyer {
        string name;
        address publicAddress;
        string shippingAddress;
        bool created;
    }
    
    // Product
    struct Product {
        uint productId;
        string name;
        string description;
        uint price;
        address payable seller;
    }
    
    // Order
    struct Order {
        uint productId;
        uint orderId;
        string status;
        address seller;
        uint price;
    }
    
    // PlacedOrder
    struct PlacedOrders {
        uint productId;
        uint orderId;
        string status;
        address buyer;
        uint price;
    }
    
    
    // Create a new seller
    function createSeller(string memory _name) public {
        Sellers[msg.sender].name = _name; // Create new instance - specify name
        Sellers[msg.sender].publicAddress = msg.sender; // Specify public address
        Sellers[msg.sender].created = true; // Validate creation
        sellerCount = sellerCount + 1; // Increment for subsequent creation
    }
    
    // Create a new buyer
    function createBuyer(string memory _name, string memory _shippingAddress) public {
        Buyers[msg.sender].name = _name; // Create new instance - specify name
        Buyers[msg.sender].publicAddress = msg.sender; // Specify public address
        Buyers[msg.sender].shippingAddress = _shippingAddress; // Specify shipping address
        Buyers[msg.sender].created = true; // Validate creation
        buyerCount = buyerCount + 1; // Increment for subsequent creation
    }
    
    // Create a new product
    function createProduct(string memory _name, string memory _description, uint _price) public {
        Product memory product = Product(productCount, _name, _description, _price, msg.sender); // Create new instance of struct
        Products[productCount].productId = productCount;
        Products[productCount].name = _name;
        Products[productCount].description = _description;
        Products[productCount].price = _price;
        Products[productCount].seller = msg.sender;
        ProductList.push(product);
        
        productCount = productCount + 1; // Increment product count for subsequent products
    }
    
    // Create a new order
    function createOrder(uint _id) public payable {
        require(msg.value == Products[_id].price, "Incorrect value of funds");
        
        Order memory order = Order(_id, orderCount, "Order Placed", Products[_id].seller, Products[_id].price); // Create new instance of struct
        UserOrders[msg.sender].push(order); // Add order to list of users' orders
        
        PlacedOrders memory placedOrder = PlacedOrders(_id, orderCount, "Order Placed", msg.sender, Products[_id].price); // Create new instance of struct
        SellerOrders[Products[_id].seller].push(placedOrder); // Add placed order to list of sellers' orrders
        
        Products[_id].seller.transfer(msg.value); // Transfer funds to seller
        
        orderCount = orderCount + 1; // Increment order count for subsequent orders
    }
    
    // Update the status of order
    function updateOrderStatus(uint _index, string memory _newStatus) public {
        PlacedOrders memory sellerOrder = SellerOrders[msg.sender][_index];
        sellerOrder.status = _newStatus;
        SellerOrders[msg.sender][_index] = sellerOrder; // Update seller's order
        
        Order memory buyerOrder = UserOrders[sellerOrder.buyer][_index];
        buyerOrder.status = _newStatus;
        UserOrders[sellerOrder.buyer][_index] = buyerOrder; // Update buyer's order
    }
    
    // Return all orders placed by a buyer
    function getBuyerOrders(uint _index) public view returns (uint, uint, string memory) {
        return(UserOrders[msg.sender][_index].productId, UserOrders[msg.sender][_index].orderId, UserOrders[msg.sender][_index].status);
    }
    
    // Return all orders recieved by a seller
    function getSellerOrders(uint _index) public view returns (uint, uint, string memory, address) {
        return(SellerOrders[msg.sender][_index].productId, SellerOrders[msg.sender][_index].orderId, SellerOrders[msg.sender][_index].status, SellerOrders[msg.sender][_index].buyer);
    }
    
}