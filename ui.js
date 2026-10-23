export const icon=(name,cls='')=>`<svg class="ui-icon ${cls}" aria-hidden="true"><use href="assets/icons.svg#${name}"/></svg>`;
export const label=(name,text)=>`${icon(name)}<span>${text}</span>`;
export function fillIcons(root=document){for(const b of root.querySelectorAll('[data-icon]'))if(!b.querySelector('.ui-icon'))b.insertAdjacentHTML('afterbegin',icon(b.dataset.icon));}
