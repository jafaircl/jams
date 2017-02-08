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
  
  build(selector = this.props.entity) {

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
  
  run(logic) {
    this.iterator = this.build();

    while (this.iterator.hasNext()) {
      logic.call(this.iterator.next());
    }
  }
  
  /*
  let keywords = new Iterator({
    entity: AdWordsApp.keywords(),
    conditions: keywordConditions,
    dateRange: dateRange
  }).toArray({
    adGroupId(){ return this.getAdGroup().getId(); },
    text(){ return this.getText(); },
  });
  */
  toArray(input){
    this.iterator = this.build();
    let arr = [];
    
    while(this.iterator.hasNext()) {
      this.item = this.iterator.next();
      
      if(input){
        let obj = {};
        for(let field in input){
          obj[field] = input[field].call(this.item);
        }
        arr.push(obj);
      } else {
        arr.push(this.item);
      }
    }
    return arr;
  }
}