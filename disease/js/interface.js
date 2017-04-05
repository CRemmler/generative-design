Interface = (function() {

  function displayLoginInterface() {
    $("#netlogo-model-container").addClass("hidden");
    $(".netlogo-tab-area .netlogo-tab-text").first().click();
    $("[cm-text]").trigger("click");
    $("#noRoomsChosen").removeClass("hidden");
  }

  function displayTeacherInterface() {
    $("#netlogo-button-21").addClass("hidden");
    $("#netlogo-button-22").addClass("hidden");
    $("#netlogo-button-23").addClass("hidden");
    $("#netlogo-button-24").addClass("hidden");
    $("#netlogo-button-25").addClass("hidden");
    $("#netlogo-slider-26").addClass("hidden");
    $("#netlogo-monitor-27").addClass("hidden");
    $("#netlogo-monitor-28").addClass("hidden");
    $("#netlogo-monitor-29").addClass("hidden");
    $("#netlogo-model-container").removeClass("hidden");
    $("#noRoomsChosen").addClass("hidden");
    $("#netlogo-inputBox-30").addClass("hidden");
  }
  
  function displayStudentInterface() {
    $("#netlogo-model-container").removeClass("hidden");
    $("#noRoomsChosen").addClass("hidden");
    $(".netlogo-widget").addClass("hidden");
    $(".netlogo-widget-error").removeClass("hidden");
    $("#netlogo-button-21").removeClass("hidden");
    $("#netlogo-button-22").removeClass("hidden");
    $("#netlogo-button-23").removeClass("hidden");
    $("#netlogo-button-24").removeClass("hidden");
    $("#netlogo-button-25").removeClass("hidden");
    $("#netlogo-slider-26").removeClass("hidden");
    $("#netlogo-monitor-27").removeClass("hidden");
    $("#netlogo-monitor-28").removeClass("hidden");
    $("#netlogo-monitor-29").removeClass("hidden");
    $(".netlogo-view-container").removeClass("hidden");
    $(".netlogo-view-container").css("top","10px");
    $(".netlogo-tab-area").addClass("hidden");
    $(".netlogo-export-wrapper").addClass("hidden");
    $("#netlogo-monitor-30").removeClass("hidden");
    $("#netlogo-monitor-31").removeClass("hidden");
    $("#netlogo-monitor-32").removeClass("hidden");
    $("#netlogo-inputBox-30").addClass("hidden");
    $("#netlogo-monitor-27 output").html("<span id='color'></span> <span id='shape'></span>");
    $("#netlogo-monitor-28 output").html("(<span id='xcor'></span>, <span id='ycor'></span>)");
    $("#netlogo-monitor-29 output").html("<span id='infected'></span>")
  }

  return {
    showLogin: displayLoginInterface,
    showTeacher: displayTeacherInterface,
    showStudent: displayStudentInterface
  };

})();