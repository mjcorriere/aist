function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (h && s === undefined && v === undefined) {
        s = h.s, v = h.v, h = h.h;
    }
    h /= 360;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

function generateByHSV() {
  var hues = [0, 15, 30, 60, 90, 135, 165, 210, 300, 330];

  var hues = [];
  var nHues = 360 / 15;

  for (var i = 0; i < nHues; i++) {
    var hue = i * (360 / nHues);
    hues.push(hue);
  }

  var saturations = [1];
  var brightnesses= [1];

  var colors = [];

for (brightness in brightnesses) {
    for (hue in hues) {
      for (saturation in saturations) {
        var rgbs = HSVtoRGB(hues[hue], saturations[saturation], brightnesses[brightness]);
        var r = rgbs[0];
        var g = rgbs[1];
        var b = rgbs[2];
        var color = 'rgb(' + r + ', ' + g + ', ' + b + ')';
        colors.push(color);
        console.log(color);
      }
    }
  }

  var colorDiv = document.getElementById('colors');
  var rowsize = 960;
  colorDiv.style.width = rowsize;

  var topmargin = 0;
  var spacing = 5;
  var boxesPerRow = hues.length;

  var boxsize = rowsize / boxesPerRow - spacing;

  for (c in colors) {
    var color = colors[c];
    var div = document.createElement("DIV");
    div.classList.add("color");
    div.style.backgroundColor = color;
    div.style.width = boxsize;
    div.style.height = boxsize;
    div.style.margin = topmargin + "px " + spacing + "px 0px 0px";
    colorDiv.appendChild(div);
  }

}

function generateByRGB() {
  var reds = [0, 63, 127, 191, 255];
  var greens = [0, 63, 127, 191, 255];
  var blues = [0, 63, 127, 191, 255];

  var colors = [];

  for (r in reds) {
    for (g in greens) {
      for (b in blues) {
        var red = reds[r];
        var green = greens[g];
        var blue = blues[b];

        var color = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
        colors.push(color);
      }
    }
  }

  var colorDiv = document.getElementById('colors');
  var rowsize = 960;
  colorDiv.style.width = rowsize;

  var topmargin = 5;
  var spacing = 5;
  var boxesPerRow = reds.length * greens.length;

  var boxsize = rowsize / boxesPerRow - spacing;

  for (c in colors) {
    var color = colors[c];
    var div = document.createElement("DIV");
    div.classList.add("color");
    div.style.backgroundColor = color;
    div.style.width = boxsize;
    div.style.height = boxsize;
    div.style.margin = topmargin + "px " + spacing + "px 0px 0px";
    colorDiv.appendChild(div);
  }  

}

function desaturate() {

      var colors = [

      // Primaries: Red, Yellow, Orange, Purple, Blue
      'rgb(255, 0, 0)',
      'rgb(235, 235, 0)',
      'rgb(232, 131, 12)',
      'rgb(142, 12, 232)',
      'rgb(12, 104, 255)',

      // Shade variation 1: 
      'rgb(255, 84, 0)',
      'rgb(137, 255, 0)',
      'rgb(232, 182, 12)',
      'rgb(232, 12, 160)',
      'rgb(120, 120, 255)',

      // Hand picked:
      'rgb(0, 255, 255)'
    ];

    var colorDiv = document.getElementById('colors');
    var rowsize = 960;
    colorDiv.style.width = rowsize;

    var topmargin = 0;
    var spacing = 5;
    var boxesPerRow = 12;

    var boxsize = rowsize / boxesPerRow - spacing;

    for (c in colors) {
      var color = colors[c];
      var div = document.createElement("DIV");
      div.classList.add("color");
      div.style.backgroundColor = color;
      div.style.width = boxsize;
      div.style.height = boxsize;
      div.style.margin = topmargin + "px " + spacing + "px 0px 0px";
      colorDiv.appendChild(div);
    }    
}

// generateByHSV();

desaturate();