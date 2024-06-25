export class FooBar{
    public name: string;
}

(function fooBar(){
    const bar = new FooBar();
    bar.name = "Testing typescript";
    console.log(bar);
})();