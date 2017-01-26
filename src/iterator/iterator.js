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
    fields: {
      adGroupId: function(){ return this.getAdGroup().getId(); },
      text: function(){ return this.getText(); },
      adArray: function(){
        let arr = [];
        let ads = this.ads().get();
        while(ads.hasNext()){
          let ad = ads.next();
          arr.push({
            id: ad.getId(),
            stats: ad.getStatsFor(dateRange)
          });
        }
        return arr;
      }
    }
  });
  */
  toArray(input){
    this.iterator = this.build();
    let arr = [];
    
    while(this.iterator.hasNext()) {
      this.item = this.iterator.next();
      
      if(input && input.fields){
        let obj = {};
        for(let field in input.fields){
          obj[field] = input.fields[field].call(this);
        }
        arr.push(obj);
      } else {
        arr.push(this.item);
      }
    }
    return arr;
  }
}