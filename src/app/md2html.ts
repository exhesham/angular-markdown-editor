export  class  TypescriptMD2HTML {
    public parse (content:string){
        let lines = content.split('\n')

    }
    is_header(line){
        let matches = line.match(new RegExp('^#{1,6}', 'g'));
        return matches.length >= 1

    }
}