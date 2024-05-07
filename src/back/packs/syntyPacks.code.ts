export const GetCollections = `
  var collections = [];
  document.querySelectorAll('.shopify-section.section')
    .forEach(c => {
      const a = c.querySelector('.collection__title a');
      collections.push({name: a.innerHTML.split(' Series')[0], url: a.href})
    });
  collections;
`

export const GetCollectionPages = `
  var pages = [];
  document.querySelectorAll('#product-grid+*+.pagination-wrapper .pagination__list .pagination__item:not(.pagination__item--current):not(.pagination__item-arrow')
    .forEach(p => pages.push(p.href));
  pages;
`

export const GetPacks = `
  var packs = [];
  document.querySelectorAll('#product-grid .grid__item .card')
    .forEach(card => {
      const img = card.querySelector('.card__media img').src;
      const head = card.querySelector('.card__content .card__information');
      const info = card.querySelector('.card__content .card-information');

      const url = head.querySelector('a').href;
      const name = head.querySelector('a').innerHTML.trim();
      const price = {
        regular: info.querySelector('.price .price__regular .price-item').innerHTML.trim(),
        sale: info.querySelector('.price .price__sale .price-item').innerHTML.trim(),
      }
      packs.push({name, url, img, price})
    });
  packs;
`

const codeGetPacks2 = `
  function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/?[A-z]*;base64,/, '');
  }

  var packs = [];
  document.querySelectorAll('#product-grid .grid__item .card')
    .forEach(card => {
      const img = getBase64Image(card.querySelector('.card__media img'));
      const head = card.querySelector('.card__content .card__information');
      const info = card.querySelector('.card__content .card-information');

      const url = head.querySelector('a').href;
      const name = head.querySelector('a').innerHTML.trim();
      const price = {
        regular: info.querySelector('.price .price__regular .price-item').innerHTML.trim(),
        sale: info.querySelector('.price .price__sale .price-item').innerHTML.trim(),
      }
      packs.push({name, url, img, price})
    });
  packs;
`
