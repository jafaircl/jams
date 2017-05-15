import { isFunction, isArray } from '../shared/utils';
import { selectorMethods } from './constants';

export function chainMethods(method, criteria, selector) {
  for (let i in criteria) {
    selector = selector[method](criteria[i]);
  }
  return selector;
}

export class Iterator {
  
  constructor(props){
    this.props = props;
  }
  
  select(selector = this.props.entity || this.props.parent) {

    for (let method in selectorMethods) {
      selector = chainMethods(
        method,
        this.props[selectorMethods[method]],
        selector
      );
    }
    
    if(isArray(this.props.dateRange)){
      selector = selector.forDateRange(this.props.dateRange[0], this.props.dateRange[1]);
    } else {
      selector = selector.forDateRange(this.props.dateRange);
    }
    
    return selector.withLimit(this.props.limit)
      .get();
  }
  
  iterate(logic) {
    this.iterator = this.select();

    while (this.iterator.hasNext()) {
      try {
        logic.call(arguments, this.iterator.next());
      } catch (e) {
        logic.call(this.iterator.next());
      }
    }
  }
  
  toArray(input){
    let arr = [];
    
    if(input){
      
      this.iterate(function() {
        
        if(isFunction(input)){
          
          arr.push(input.call(arguments, this));
        } else {
          
          let obj = {};
          for(let field in input){
            obj[field] = input[field].call(arguments, this);
          }
          arr.push(obj);
        }
      });
    } else {
      
      this.iterate(item => {
        arr.push(item);
      });
    }
    
    return arr;
  }
}