/* */ 
"format cjs";
System.register(["./register-circular1"], function($__export) {
  "use strict";
  var c,
      p;
  return {
    setters: [function(m) {
      p = m.p;
    }],
    execute: function() {
      c = $__export("c", 3);
      p();
    }
  };
});