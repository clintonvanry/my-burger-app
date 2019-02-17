import React, {Component} from 'react';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../withErrorHandler/withErrorHandler';

const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
};

class BurgerBuilder extends Component{

    state = {
        ingredients:null,
        totalPrice: 4,
        purchaseable: false,
        purchasing: false,
        loading:false,
        error: false
    };

    componentDidMount(){
        axios.get('https://react-my-burger-1d1b1.firebaseio.com/ingredients.json')
        .then(response => {
            console.log(response);
            this.setState({ingredients: response.data});
        }).catch(error => {
            console.log(error);
            this.setState({error:true});
        });
    }

    addIngredientHandler = (type) =>{
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount + 1;
        const updatedIngredients = {...this.state.ingredients};
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;

        this.setState({ingredients:updatedIngredients, totalPrice: newPrice}); 
        this.updatePurchaseableState(updatedIngredients);
    }

    removeIngredientHandler = (type) =>{
        const oldCount = this.state.ingredients[type];
        if(oldCount <= 0){
            return;
        }
        const updatedCount = oldCount - 1;
        const updatedIngredients = {...this.state.ingredients};
        updatedIngredients[type] = updatedCount;
        const priceReduction = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceReduction;

        this.setState({ingredients:updatedIngredients, totalPrice: newPrice}); 
        this.updatePurchaseableState(updatedIngredients);
    }

    updatePurchaseableState = (updatedIngredients) => {
        const ingredients = updatedIngredients; //{...this.state.ingredients}; state can be old
        const sum = Object.keys(ingredients).map(igKey => {
            return ingredients[igKey]
        }).reduce((sum,el) => {
            return sum + el;
        },0);

        console.log(sum);

        this.setState({purchaseable: sum > 0});
    }

    purchaseHandler = () => {
        this.setState({purchasing:true});
    }

    purchaseCancelHandler = () =>{
        this.setState({purchasing:false});
    }

    purchaseContinueHandler=()=>{
        //alert('You continue.');
        this.setState({loading:true});
        const order ={
            ingredients: this.state.ingredients,
            price: this.state.totalPrice, // this should be done server side
            customer:{
                name:'Clinton',
                address:{
                    street: 'street',
                    city: 'city',
                    postcode:'postcode',
                    country:'country'
                },
                email:'test@test.com'
            },
            deliveryMethod:'fastest'
        };

         axios.post('/orders.json',order)
         .then(response => {
             console.log(response);
             this.setState({loading:false, purchasing:false});
         })
         .catch(error => {
             console.error(error);
             this.setState({loading:false, purchasing:false});
         });
        
    }

    render(){
        const disabledInfo = {
            ...this.state.ingredients
        };

        for(let key in disabledInfo){
            disabledInfo[key] = disabledInfo[key] <= 0
        }

        let orderSummary = null;

        let burger = this.state.error ? <p>Failed to load ingredients</p> : <Spinner/>;
        if(this.state.ingredients){
            burger = (<>
                        <Burger ingredients={this.state.ingredients}/>
                        <BuildControls 
                            addIngredient={this.addIngredientHandler} 
                            removeIngredient={this.removeIngredientHandler}
                            disabled={disabledInfo} 
                            price={this.state.totalPrice}
                            purchaseable={this.state.purchaseable}
                            ordered={this.purchaseHandler}></BuildControls>
                        </>);
            orderSummary = <OrderSummary ingredients={this.state.ingredients}
                purchaseCancel={this.purchaseCancelHandler}
                purchaseContinue={this.purchaseContinueHandler}
                price={this.state.totalPrice}
                />;
        }
        if(this.state.loading){
            orderSummary = <Spinner/>;
        }

        return(
            <>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </>
        );
    }

};

export default withErrorHandler(BurgerBuilder, axios);