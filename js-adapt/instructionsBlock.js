
// show instructions, wait for continue button press
function InstructionsBlock(instructions) {
    this.instructions = instructions;
    this.onEndedBlock = function() {return this;};
}

InstructionsBlock.prototype = {
    run: function() {
        $("#instructions").html(this.instructions).show();
        var _self = this;
        continueButton(function() {
                           $("#instructions").hide();
                           _self.onEndedBlock();
                       });
    }
};

