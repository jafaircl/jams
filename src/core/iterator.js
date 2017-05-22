import { isArray, isFunction } from '../shared/utils';

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
    this.entity = this.props.entity;
    this.parent = this.props.parent;
    this.conditions = this.props.conditions;
    this.dateRange = this.props.dateRange;
    this.orderBy = this.props.orderBy;
    this.ids = this.props.ids;
    this.limit = this.props.limit;
  }
  
  select(selector = this.entity || this.parent) {

    for (let method in selectorMethods) {
      selector = chainMethods(
        method,
        this[selectorMethods[method]],
        selector
      );
    }
    
    if(isArray(this.dateRange)){
      selector = selector.forDateRange(this.dateRange[0], this.dateRange[1]);
    } else {
      selector = selector.forDateRange(this.dateRange);
    }
    
    return selector.withLimit(this.limit)
      .get();
  }
  
  iterate(logic) {
    this.iterator = this.select();
    
    try {
      while (this.iterator.hasNext()) {
        logic(this.iterator.next());
      }
        
    } catch (e) {
      Logger.log(e);
      while (this.iterator.hasNext()) {
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