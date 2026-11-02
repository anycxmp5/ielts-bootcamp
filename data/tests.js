/* Полные тесты: какие наборы и задания входят в каждый */
(function () {
  'use strict';
  window.IE.addTests([
    { id: 1, title: 'Test 1', listening: ['l11', 'l12', 'l13', 'l14'], reading: ['r11', 'r12', 'r13'], writing: ['t1-1', 't2-1'], speaking: ['p1-hometown', 'p2-person'] },
    { id: 2, title: 'Test 2', listening: ['l21', 'l22', 'l23', 'l24'], reading: ['r21', 'r22', 'r23'], writing: ['t1-2', 't2-2'], speaking: ['p1-work', 'p2-place'] },
    { id: 3, title: 'Test 3', listening: ['l31', 'l32', 'l33', 'l34'], reading: ['r31', 'r32', 'r33'], writing: ['t1-3', 't2-3'], speaking: ['p1-technology', 'p2-gadget'] },
  ]);
})();
