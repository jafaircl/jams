import { Iterator } from './iterator';
import { isArray } from './utils';

/*
 * Add A Label To An Account
 * ---
 * @param {string} labelName - A name for the label
 * @param {string} labelColor - A hex color for the label.
 */
export function addLabel(labelName, labelColor) {
  
  var labelIterator = AdWordsApp.labels()
      .withCondition('Name = "' + labelName + '"')
      .get();
  if (!labelIterator.hasNext()) {
    AdWordsApp.createLabel(labelName, '', labelColor);
  }
}

/*
 * Delete A Label From An Account
 * ---
 * @param {string} contains - A unique text string for all the labesl to delete.
 */
export function deleteLabel(contains) {
  
  var labelIterator = AdWordsApp.labels()
      .withCondition('LabelName CONTAINS "' + contains + '"')
      .get();
  while (labelIterator.hasNext()) {
    var labelName = labelIterator.next();
    labelName.remove();
  }
}

/*
 * Remove Labels From An Entity
 * ---
 * @param {string} labelName - A name for the label
 * @param {string} entity - An entity from which to remove labels
 */
export function removeLabelFrom(entity, labelNames) {
  let labelString = isArray(labelNames) ? labelNames.join('","') : labelNames;
  
  new Iterator({
    entity: entity,
    conditions: [`LabelNames CONTAINS_ANY ["${labelString}"]`]
  }).run(function(){
    if(isArray(labelNames)){
      for(let i in labelNames){
        this.removeLabel(labelNames[i]);
      }
    } else {
      this.removeLabel(labelNames);
    }
    
  });
}