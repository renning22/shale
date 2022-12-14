// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";

struct Product {
    uint256 ProductId;
    string Specs;
    uint256 FixedPrice;
    address Owner;
    bool Used;
    bool Listed;
}

struct Order {
    uint256 OrderId;
    address User;
    uint256 ProductId;
    address ProductOwner;
    string ProductSpecs;
    uint256 ProductFixedPrice;
    uint256 OrderBalance;
    string LoginInfo;
    string UserInfo;
    bool Confirm;
    uint256 BeginOn;
    uint256 FinishOn;
    uint256 CreateOn;
}

contract Shale is Context {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    event ProductPut(uint256 indexed productId, address indexed owner);

    event OrderCreated(
        uint256 indexed orderId,
        uint256 indexed productId,
        address indexed user
    );

    event OrderConfirm(uint256 indexed orderId, bool confirm);

    event OrderClosed(uint256 indexed orderId, address indexed operator);

    mapping(uint256 => Product) products;
    mapping(uint256 => Order) orders;

    mapping(address => uint256[]) rentProductList;
    mapping(address => uint256[]) rentOutList;
    mapping(address => uint256[]) rentList;

    Counters.Counter private orderNoCounter;
    Counters.Counter private productNoCounter;

    uint256[] markets = new uint256[](0);

    /**
     * add machine
     */
    function putProduct(uint256 fixedPrice, string calldata specs)
        external
        returns (uint256)
    {
        uint256 productId = 20000000000000 +
            (block.timestamp * 1000) +
            productNoCounter.current();

        Product memory product = Product(
            productId,
            specs,
            fixedPrice,
            _msgSender(),
            false,
            true
        );

        //update rent out machine list
        uint256[] storage rentOutProducts = rentProductList[_msgSender()];
        rentOutProducts.push(productId);
        rentProductList[_msgSender()] = rentOutProducts;

        //push to store
        markets.push(productId);

        //save machine info
        products[productId] = product;

        //increment number
        productNoCounter.increment();

        emit ProductPut(productId, _msgSender());

        return productId;
    }

    /**
     * create order
     */
    function takeProduct(
        uint256 productId,
        uint256 hrs,
        string calldata userInfo
    ) external payable returns (uint256) {
        require(products[productId].ProductId > 0, "product not found");
        require(products[productId].Used == false, "used");
        require(hrs > 0, "hrs is zero");

        uint256 amount = products[productId].FixedPrice.mul(hrs);
        require(amount <= msg.value, "insufficient value");

        orderNoCounter.increment();

        uint256 orderId = orderNoCounter.current().mul(10000000000000).add(
            block.timestamp
        );

        Product memory product = products[productId];
        product.Used = true;
        products[productId] = product;

        Order memory order = Order(
            orderId,
            _msgSender(),
            product.ProductId,
            product.Owner,
            product.Specs,
            product.FixedPrice,
            amount,
            "",
            userInfo,
            false,
            0,
            0,
            block.timestamp
        );

        //update rent order list
        uint256[] storage rents = rentList[_msgSender()];
        rents.push(orderId);
        rentList[_msgSender()] = rents;

        //update rent out order list
        uint256[] storage rentOuts = rentOutList[product.Owner];
        rentOuts.push(orderId);
        rentOutList[product.Owner] = rentOuts;

        //save order info
        orders[orderId] = order;

        emit OrderCreated(order.OrderId, product.ProductId, order.User);

        return orderId;
    }

    /**
     * setup machine
     */
    function setupOrder(
        uint256 orderId,
        bool confirm,
        string calldata loginInfo
    ) external {
        require(orders[orderId].OrderId > 0, "order not found");
        require(orders[orderId].ProductOwner == _msgSender(), "not owner");

        Order memory order = orders[orderId];
        if (confirm) {
            order.Confirm = true;
            order.LoginInfo = loginInfo;
            order.BeginOn = block.timestamp;
        } else {
            Product memory product = products[order.ProductId];
            product.Used = false;
            products[order.ProductId] = product;

            order.Confirm = false;
            order.FinishOn = block.timestamp;
        }

        orders[orderId] = order;

        emit OrderConfirm(order.OrderId, order.Confirm);
    }

    /**
     * close/abort machine
     */
    function closeOrder(uint256 orderId) external {
        require(orders[orderId].OrderId > 0, "order not found");
        require(
            orders[orderId].ProductOwner == _msgSender() ||
                orders[orderId].User == _msgSender(),
            "not owner"
        );

        Order memory order = orders[orderId];
        order.FinishOn = block.timestamp;
        orders[orderId] = order;

        Product memory product = products[order.ProductId];
        product.Used = false;
        products[order.ProductId] = product;

        if (order.Confirm) {
            //payment
            address payable owner = payable(order.ProductOwner);
            owner.transfer(order.OrderBalance);
        } else {
            //return
            address payable user = payable(order.User);
            user.transfer(order.OrderBalance);
        }

        emit OrderClosed(order.OrderId, _msgSender());
    }

    /**
     * set machine listed/unlisted
     */
    function modifyProduct(uint256 productId, bool listed) external {
        require(products[productId].ProductId > 0, "product not found");
        require(products[productId].Owner == _msgSender(), "not owner");

        Product memory product = products[productId];
        product.Listed = listed;
        products[productId] = product;
    }

    /**
     * get order by id
     */
    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    /**
     * get machine by id
     */
    function getProduct(uint256 productId)
        external
        view
        returns (Product memory)
    {
        return products[productId];
    }

    /**
     * get rent out machine list
     */
    function getRentOutProduct(address addr)
        external
        view
        returns (Product[] memory)
    {
        uint256[] memory rentOutProducts = rentProductList[addr];
        Product[] memory list = new Product[](rentOutProducts.length);
        for (uint256 i = 0; i < rentOutProducts.length; i++) {
            list[i] = products[rentOutProducts[i]];
        }

        return list;
    }

    /**
     * get rent out order list
     */
    function getRentOutOrders(address addr)
        external
        view
        returns (Order[] memory)
    {
        return getOrderList(rentOutList[addr]);
    }

    /**
     * get rent order list
     */
    function getRentOrders(address addr)
        external
        view
        returns (Order[] memory)
    {
        return getOrderList(rentList[addr]);
    }

    /**
     * get store machine list
     */
    function getMarketList(address owner)
        external
        view
        returns (Product[] memory)
    {
        Product[] memory list = new Product[](markets.length);
        for (uint256 i = 0; i < markets.length; i++) {
            Product memory p = products[markets[i]];

            if (owner != address(0) && owner != p.Owner) {
                continue;
            }

            if (p.Listed == false || p.Used == true) {
                continue;
            }

            list[i] = p;
        }

        return list;
    }

    /**
     * get order list by id array
     */
    function getOrderList(uint256[] memory ids)
        private
        view
        returns (Order[] memory)
    {
        Order[] memory list = new Order[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            list[i] = orders[ids[i]];
        }

        return list;
    }
}
