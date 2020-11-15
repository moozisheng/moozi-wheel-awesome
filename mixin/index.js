module.exports = (receivingClass, givingClass) => {
    if (receivingClass && givingClass) {
      for (let key in givingClass) {
        if (receivingClass.prototype.hasOwnProperty(key)) {
          throw new Error(`"Don't allow override  existed prototype method. The method is: ${key}"`)
        }
        receivingClass.prototype[key] = givingClass[key]
      }
    }
}