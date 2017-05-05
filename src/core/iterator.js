import { isFunction, isObject } from '../shared/utils';

const repeatableMethods = {
  withIds: 'ids',
  withCondition: 'conditions',
  orderBy: 'orderBy'
};

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
  
  select(selector = this.props.entity) {

    for (let method in repeatableMethods) {
      selector = chainMethods(
        method,
        this.props[repeatableMethods[method]],
        selector
      );
    }
    return selector.forDateRange(this.props.dateRange)
      .withLimit(this.props.limit)
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
    
    this.iterate(function(){
      if(input){
        if(isObject(input)){
          let obj = {};
          
          for(let field in input){
            try {
              obj[field] = input[field].call(arguments, this);
            } catch (e) {
              obj[field] = input[field].call(this);
            }
          }
          arr.push(obj);
        } else {
          arr.push(input(this));
        }
      } else {
        arr.push(this);
      }
    });
    
    return arr;
  }
}